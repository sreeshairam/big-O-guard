import subprocess
import ast
import os
import time
import tracemalloc
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ─── Static Analysis ──────────────────────────────────────────────────────────


class ComplexityAnalyzer(ast.NodeVisitor):
    def __init__(self, func_names=None):
        self.loop_depth = 0
        self.max_loop_depth = 0
        self.has_recursion = False
        self.current_func = None
        self.func_names = func_names or set()

    def visit_FunctionDef(self, node):
        prev = self.current_func
        self.current_func = node.name
        self.generic_visit(node)
        self.current_func = prev

    visit_AsyncFunctionDef = visit_FunctionDef

    def visit_For(self, node):
        self.loop_depth += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)
        self.generic_visit(node)
        self.loop_depth -= 1

    visit_While = visit_For

    def visit_Call(self, node):
        func = node.func
        called_name = None

        if isinstance(func, ast.Name):
            called_name = func.id
        elif isinstance(func, ast.Attribute):
            called_name = func.attr

        if called_name and self.current_func and called_name == self.current_func:
            self.has_recursion = True

        self.generic_visit(node)


def collect_function_names(tree):
    return {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }


def static_analysis(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return None, f"Syntax error: {e}"

    func_names = collect_function_names(tree)
    analyzer = ComplexityAnalyzer(func_names)
    analyzer.visit(tree)

    depth = analyzer.max_loop_depth
    recursion = analyzer.has_recursion

    if recursion:
        return {
            "time_complexity": "O(2^n)",
            "loop_depth": depth,
            "has_recursion": True,
            "explanation": "Recursive calls detected → exponential time.",
        }, None

    elif depth >= 2:
        return {
            "time_complexity": "O(n^2)",
            "loop_depth": depth,
            "has_recursion": False,
            "explanation": f"{depth} nested loops detected → polynomial time.",
        }, None

    elif depth == 1:
        return {
            "time_complexity": "O(n)",
            "loop_depth": depth,
            "has_recursion": False,
            "explanation": "Single loop detected → linear time.",
        }, None

    else:
        return {
            "time_complexity": "O(1)",
            "loop_depth": depth,
            "has_recursion": False,
            "explanation": "No loops/recursion → constant time.",
        }, None


# ─── Runtime & Space Analysis ─────────────────────────────────────────────────


def runtime_and_space_analysis(code: str):
    namespace = {}
    error = None

    tracemalloc.start()
    start = time.perf_counter()

    try:
        compiled_code = compile(code, "<string>", "exec")
        exec(compiled_code, namespace)
    except Exception as exc:
        error = str(exc)

    elapsed_ms = (time.perf_counter() - start) * 1000
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    peak_kb = peak_bytes / 1024

    collections_created = sum(
        1
        for k, v in namespace.items()
        if not k.startswith("__") and isinstance(v, (list, dict, set, tuple))
    )

    if collections_created == 0:
        space_complexity = "O(1)"
        space_note = "Constant space."
    else:
        space_complexity = "O(n)"
        space_note = "Uses collections → linear space."

    return {
        "execution_time_ms": round(elapsed_ms, 4),
        "peak_memory_kb": round(peak_kb, 4),
        "space_complexity": space_complexity,
        "space_note": space_note,
        "runtime_error": error,
    }


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    code = data.get("code", "").strip()

    if not code:
        return jsonify({"error": "No code provided."}), 400

    # 🔍 Static Analysis
    static, err = static_analysis(code)
    if err:
        return jsonify({"error": err, "ci_cd": "❌ NOT READY"}), 400

    # ⚡ Runtime Analysis
    runtime = runtime_and_space_analysis(code)

    # 🚨 Stop if runtime error
    if runtime["runtime_error"]:
        return jsonify(
            {"error": runtime["runtime_error"], "ci_cd": "❌ NOT READY"}
        ), 400

    # 🧪 Run test file
    test_output = subprocess.getoutput("python test_analyzer.py")

    # Decide CI/CD status
    if "FAILED" in test_output or "Error" in test_output:
        ci_cd_status = "❌ NOT READY"
    else:
        ci_cd_status = "🚀 READY!"

    result = {
        "time_complexity": static["time_complexity"],
        "space_complexity": runtime["space_complexity"],
        "execution_time_ms": runtime["execution_time_ms"],
        "peak_memory_kb": runtime["peak_memory_kb"],
        "explanation": static["explanation"],
        "space_note": runtime["space_note"],
        "test_output": test_output,
        "test_suite": {
            "ci_cd": ci_cd_status,
        },
    }

    return jsonify(result)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"Starting Python Complexity Analyzer on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
