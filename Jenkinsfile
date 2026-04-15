pipeline {
    agent any

    environment {
        APP_DIR = 'python-analyzer'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '==> Checking out source code...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo '==> Installing Python dependencies...'
                sh '''
                    cd ${APP_DIR}
                    pip install -r requirements.txt --quiet
                    echo "Dependencies installed successfully."
                '''
            }
        }

        stage('Test') {
            steps {
                echo '==> Running analyzer unit tests...'
                sh '''
                    cd ${APP_DIR}
                    python test_analyzer.py
                '''
            }
        }

        stage('Analyze') {
            steps {
                echo '==> Running sample complexity analyses...'
                sh '''
                    python - << 'PYEOF'
import sys, json
sys.path.insert(0, 'python-analyzer')
from app import static_analysis, runtime_and_space_analysis

samples = [
    ("Constant O(1)",    "x = 1 + 2\ny = x * 3"),
    ("Linear O(n)",      "for i in range(100):\n    print(i)"),
    ("Quadratic O(n^2)", "for i in range(50):\n    for j in range(50):\n        pass"),
    ("Recursive O(2^n)", "def fib(n):\n    if n<=1: return n\n    return fib(n-1)+fib(n-2)"),
]

print("\\n" + "=" * 60)
print("  big-O-guard  |  Complexity Analysis Report")
print("=" * 60)

for label, code in samples:
    static, err = static_analysis(code)
    if err:
        print(f"\\n[ERROR] {label}: {err}")
        continue
    runtime = runtime_and_space_analysis(code)
    print(f"\\n[{label}]")
    print(f"  Time Complexity  : {static['time_complexity']}")
    print(f"  Space Complexity : {runtime['space_complexity']}")
    print(f"  Execution Time   : {runtime['execution_time_ms']} ms")
    print(f"  Peak Memory      : {runtime['peak_memory_kb']} KB")
    print(f"  Explanation      : {static['explanation'][:80]}...")

print("\\n" + "=" * 60)
print("  Analysis complete.")
print("=" * 60 + "\\n")
PYEOF
                '''
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully. All stages passed!'
        }
        failure {
            echo 'Pipeline failed. Check the console output above for details.'
        }
    }
}
