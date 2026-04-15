def check_duplicates(data):
    # This code works (Functional), but it is O(n^2) (Inefficient)
    for i in range(len(data)):
        for j in range(len(data)):
            if i != j and data[i] == data[j]:
                return True
    return False


# NORMAL TEST (Functional)
if __name__ == "__main__":
    test_data = [1, 2, 3, 2]
    result = check_duplicates(test_data)
    if result == True:
        print("NORMAL TEST: Logic is Correct (Duplicate Found) ✅")
    else:
        print("NORMAL TEST: Logic Failed ❌")
