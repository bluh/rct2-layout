export class UniqueNameGenerator {
    static next: number = 0;

    static getNext(name?: string) {
        const result = (name || "") + this.next;
        this.next += 1;
        return result;
    }
}