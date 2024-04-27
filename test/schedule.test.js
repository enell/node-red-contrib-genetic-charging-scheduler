const { expect, describe } = require('@jest/globals');
const { DoublyLinkedList } = require('../src/schedule');

describe('Schedule', () => {
  describe('insertFront', () => {
    test('insertFront 1 event', () => {
      const schedule = new DoublyLinkedList();
      schedule.insertFront({ start: 5 });
      expect(schedule.head).toEqual(schedule.tail);
    });

    test('insertFront 2 events', () => {
      const schedule = new DoublyLinkedList();
      schedule.insertFront({ start: 5 });
      schedule.insertFront({ start: 11 });

      expect(schedule.head.data.start).toEqual(11);
      expect(schedule.tail.data.start).toEqual(5);
      expect(schedule.head).toEqual(schedule.tail.previous);
      expect(schedule.tail).toEqual(schedule.head.next);
    });
  });

  describe('insertBack', () => {
    test('insertBack 1 event', () => {
      const schedule = new DoublyLinkedList();
      schedule.insertBack({ start: 5 });
      expect(schedule.head).toEqual(schedule.tail);
    });

    test('insertBack 2 events', () => {
      const schedule = new DoublyLinkedList();
      schedule.insertBack({ start: 5 });
      schedule.insertBack({ start: 11 });

      expect(schedule.head.data.start).toEqual(5);
      expect(schedule.tail.data.start).toEqual(11);
      expect(schedule.head).toEqual(schedule.tail.previous);
      expect(schedule.tail).toEqual(schedule.head.next);
    });
  });
});
