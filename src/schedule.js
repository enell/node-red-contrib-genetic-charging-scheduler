// Define the Node class for each node in the doubly linked list
class Node {
  constructor(data) {
    this.data = data;
    this.previous = null;
    this.next = null;
  }
}

// Define the DoublyLinkedList class
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  // Function to insert a node at the front of the list
  insertFront(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.previous = newNode;
      this.head = newNode;
    }
    this.length++;
    return this;
  }

  // Function to insert a node at the end of the list
  insertBack(data) {
    const newNode = new Node(data);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.previous = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  toArray() {
    return this.reduce((acc, data) => {
      acc.push(data);
      return acc;
    }, []);
  }

  toString() {
    return JSON.stringify(this.toArray());
  }

  reduce(callback, initialValue) {
    let accumulator = initialValue;
    let node = this.head;
    while (node) {
      accumulator = callback(accumulator, node.data, node);
      node = node.next;
    }
    return accumulator;
  }

  forEach(callbackFn) {
    this.reduce((acc, data) => {
      callbackFn(data);
      return acc;
    }, 0);
  }

  map(callbackFn) {
    return this.reduce(
      (acc, data, node) => acc.insertBack(callbackFn(data, node)),
      new DoublyLinkedList()
    );
  }

  filter(predicate) {
    return this.reduce((acc, data, node) => {
      if (predicate(data, node)) acc.insertBack(data);
      return acc;
    }, new DoublyLinkedList());
  }
}

module.exports = {
  DoublyLinkedList,
};
