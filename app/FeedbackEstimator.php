<?php

namespace App;

use InvalidArgumentException;

class FeedbackEstimator
{
    /**
     * @param  array{int, int, int}  $counts
     * @return array{status: string, n: int, estimate: list<float>, intervals: list<array{float, float}>, inverse: list<float>, unboundedIntervals: list<array{float, float}>, z: float}
     */
    public function estimate(array $counts, int $families = 1): array
    {
        if (min($counts) < 0 || $families < 1) {
            throw new InvalidArgumentException('Invalid aggregate counts.');
        }
        $n = array_sum($counts);
        $z = $this->bonferroniZ(3 * $families);
        if ($n === 0) {
            return ['status' => 'insufficient_contributions', 'n' => 0, 'estimate' => [], 'intervals' => [], 'inverse' => [], 'unboundedIntervals' => [], 'z' => $z];
        }
        $q = 1 / (exp(1) + 2);
        $difference = (exp(1) - 1) / (exp(1) + 2);
        $free = [0, 1, 2];
        $probabilities = [$q, $q, $q];
        while ($free !== []) {
            $total = array_sum(array_map(fn (int $i): int => $counts[$i], $free));
            $budget = 1 - (3 - count($free)) * $q;
            $remove = array_filter($free, fn (int $i): bool => $q > $counts[$i] / $total * $budget);
            if ($remove === []) {
                foreach ($free as $i) {
                    $probabilities[$i] = $counts[$i] / $total * $budget;
                }
                break;
            }
            $free = array_values(array_diff($free, $remove));
        }
        $estimate = array_map(fn (float $r): float => ($r - $q) / $difference, $probabilities);
        $inverse = [];
        $intervals = [];
        $unbounded = [];
        $compatible = true;
        $wide = false;
        foreach ($counts as $count) {
            $r = $count / $n;
            $inverse[] = ($r - $q) / $difference;
            $denominator = 1 + $z * $z / $n;
            $center = ($r + $z * $z / (2 * $n)) / $denominator;
            $half = $z * sqrt($r * (1 - $r) / $n + $z * $z / (4 * $n * $n)) / $denominator;
            $low = ($center - $half - $q) / $difference;
            $high = ($center + $half - $q) / $difference;
            $unbounded[] = [$low, $high];
            $intervals[] = [max(0.0, $low), min(1.0, $high)];
            $compatible = $compatible && $low <= 1 && $high >= 0;
            $wide = $wide || ($high - $low) / 2 > 0.1;
        }
        $compatible = $compatible && array_sum(array_column($intervals, 0)) <= 1 && array_sum(array_column($intervals, 1)) >= 1;
        $status = match (true) {
            $n < 500 => 'insufficient_contributions',
            ! $compatible => 'protocol_incompatible',
            $wide => 'uncertainty_too_wide',
            default => 'published',
        };

        return ['status' => $status, 'n' => $n, 'estimate' => $estimate, 'intervals' => $intervals, 'inverse' => $inverse, 'unboundedIntervals' => $unbounded, 'z' => $z];
    }

    private function bonferroniZ(int $cells): float
    {
        $target = 1 - 0.05 / (2 * $cells);
        $low = 0.0;
        $high = 8.0;
        for ($iteration = 0; $iteration < 60; $iteration++) {
            $value = ($low + $high) / 2;
            $t = 1 / (1 + 0.2316419 * $value);
            $tail = exp(-$value * $value / 2) / sqrt(2 * M_PI) * ($t * (0.319381530 + $t * (-0.356563782 + $t * (1.781477937 + $t * (-1.821255978 + $t * 1.330274429)))));
            if (1 - $tail < $target) {
                $low = $value;
            } else {
                $high = $value;
            }
        }

        return ($low + $high) / 2;
    }
}
