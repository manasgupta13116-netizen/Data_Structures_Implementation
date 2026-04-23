#include <vector>
using namespace std;
vector<int> ll;
vector<int> stackArr;
vector<int> queueArr;

extern "C" {

    // ================= LINKED LIST =================
    void llInsertStart(int val) { ll.insert(ll.begin(), val); }
    void llInsertEnd(int val) { ll.push_back(val); }
    void llInsertAtPos(int val, int pos) {
        int p = pos - 1;
        if (p >= 0 && p <= ll.size()) { ll.insert(ll.begin() + p, val); }
    }
    void llDeleteAtPos(int pos) {
        int p = pos - 1;
        if (p >= 0 && p < ll.size()) { ll.erase(ll.begin() + p); }
    }
    int llGetSize() { return ll.size(); }
    int llGetValueAt(int index) { return ll[index]; }

    // ================= STACK =================
    void stackPush(int val) { stackArr.push_back(val); }
    void stackPop() { if (!stackArr.empty()) { stackArr.pop_back(); } }
    int stackPeek() { if (!stackArr.empty()) return stackArr.back(); return -1; }
    int stackIsEmpty() { return stackArr.empty() ? 1 : 0; } 
    int stackGetSize() { return stackArr.size(); }
    int stackGetValueAt(int index) { return stackArr[index]; }

    // ================= QUEUE =================
    void queueEnqueue(int val) { queueArr.push_back(val); }
    void queueDequeue() { if (!queueArr.empty()) { queueArr.erase(queueArr.begin()); } }
    int queueGetSize() { return queueArr.size(); }
    int queueGetValueAt(int index) { return queueArr[index]; }

}