// Define the Node class for each node in the doubly linked list
export class Node<T> {
  data: T;
  next: Node<T> | null;
  previous: Node<T> | null;
  constructor(data: T) {
    this.data = data;
    this.previous = null;
    this.next = null;
  }
}

// Define the DoublyLinkedList class
export class DoublyLinkedList<T> {
  private _head: Node<T> | null;
  private _tail: Node<T> | null;
  length: number;

  constructor() {
    this._head = null;
    this._tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.length === 0;
  }

  get head(): Node<T> {
    if (this.isEmpty()) throw new Error('List is empty');
    return this._head!;
  }

  get tail(): Node<T> {
    if (this.isEmpty()) throw new Error('List is empty');
    return this._tail!;
  }

  // Function to insert a node at the front of the list
  insertFront(data: T) {
    const newNode = new Node(data);
    if (!this._head) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.previous = newNode;
      this._head = newNode;
    }
    this.length++;
    return this;
  }

  // Function to insert a node at the end of the list
  insertBack(data: T) {
    const newNode = new Node(data);
    if (!this._tail) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      newNode.previous = this.tail;
      this.tail.next = newNode;
      this._tail = newNode;
    }
    this.length++;
    return this;
  }

  toArray() {
    return this.reduce((acc, data) => {
      acc.push(data);
      return acc;
    }, [] as T[]);
  }

  toString() {
    return JSON.stringify(this.toArray());
  }

  reduce<R>(callback: (acc: R, data: T, node: Node<T>) => R, initialValue: R) {
    let accumulator = initialValue;
    let node: Node<T> | null = this.head;
    while (node) {
      accumulator = callback(accumulator, node.data, node);
      node = node.next;
    }
    return accumulator;
  }

  forEach(callbackFn: (data: T) => void) {
    this.reduce((acc, data) => {
      callbackFn(data);
      return acc;
    }, 0);
  }

  map(callbackFn: (data: T, node: Node<T>) => T) {
    return this.reduce(
      (acc, data, node) => acc.insertBack(callbackFn(data, node)),
      new DoublyLinkedList<T>()
    );
  }

  filter(predicate: (data: T, node: Node<T>) => boolean) {
    return this.reduce((acc, data, node) => {
      if (predicate(data, node)) acc.insertBack(data);
      return acc;
    }, new DoublyLinkedList<T>());
  }
}
