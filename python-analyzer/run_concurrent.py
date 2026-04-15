import multiprocessing
import os


def run_functional_test():
    print("🚀 Starting Functional Tests...")
    os.system("python smart_sensor.py")
    print("✅ Functional Tests Finished.")


def run_complexity_audit():
    print("🔍 Starting Big-O Complexity Audit...")
    os.system("python analyzer.py smart_sensor.py")
    print("✅ Complexity Audit Finished.")


if __name__ == "__main__":
    # Create two separate processes
    p1 = multiprocessing.Process(target=run_functional_test)
    p2 = multiprocessing.Process(target=run_complexity_audit)

    # Start both at the exact same time
    p1.start()
    p2.start()

    # Wait for both to finish before ending the Jenkins build
    p1.join()
    p2.join()

    print("\n--- ALL CONCURRENT ANALYSES COMPLETE ---")
