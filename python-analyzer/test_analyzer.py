"""
Automated tests for the complexity analyzer — used in Jenkins CI.
Run with:  python test_analyzer.py
"""

import json
import sys
import os

# Allow importing app from parent context
sys.path.insert(0, os.path.dirname(__file__))

from app import static_analysis, runtime_and_space_analysis


PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

results = []


def check(name, got, expected):
    ok = got == expected
    status = PASS if ok else FAIL
    print(f"  [{status}] {name}")
    if not ok:
        print(f"         expected={expected!r}, got={got!r}")
    results.append(ok)


print("\n=== Static Analysis Tests ===\n")

# O(1) — no loops
code_o1 = "x = 1 + 2\ny = x * 3"
r, _ = static_analysis(code_o1)
check("O(1) constant", r["time_complexity"], "O(1)")

# O(n) — single loop
code_on = "for i in range(10):\n    print(i)"
r, _ = static_analysis(code_on)
check("O(n) single loop", r["time_complexity"], "O(n)")

# O(n^2) — nested loop
code_on2 = "for i in range(n):\n    for j in range(n):\n        pass"
r, _ = static_analysis(code_on2)
check("O(n^2) nested loops", r["time_complexity"], "O(n^2)")

# O(2^n) — recursion
code_rec = (
    "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)"
)
r, _ = static_analysis(code_rec)
check("O(2^n) recursion", r["time_complexity"], "O(2^n)")

# Syntax error handling
bad_code = "def broken(:\n    pass"
r, err = static_analysis(bad_code)
check("Syntax error caught", r is None and err is not None, True)

print("\n=== Runtime & Space Tests ===\n")

r = runtime_and_space_analysis("x = 1 + 2")
check("Execution time is non-negative", r["execution_time_ms"] >= 0, True)
check("Peak memory is non-negative", r["peak_memory_kb"] >= 0, True)
check("O(1) space for no collections", r["space_complexity"], "O(1)")

r = runtime_and_space_analysis("data = [i for i in range(100)]")
check("O(n) space with list", r["space_complexity"], "O(n)")

print("\n=== Sample Output ===\n")
sample = "for i in range(100):\n    for j in range(100):\n        pass"
static, _ = static_analysis(sample)
runtime = runtime_and_space_analysis(sample)
output = {
    "time_complexity": static["time_complexity"],
    "space_complexity": runtime["space_complexity"],
    "execution_time_ms": runtime["execution_time_ms"],
    "peak_memory_kb": runtime["peak_memory_kb"],
    "explanation": static["explanation"],
}
print(json.dumps(output, indent=2))

passed = sum(results)
total = len(results)
print(f"\n{'=' * 40}")
print(f"Results: {passed}/{total} tests passed")

if passed < total:
    print("SOME TESTS FAILED")
    sys.exit(1)
else:
    print("ALL TESTS PASSED")
    sys.exit(0)
