/* ------------
   Interrupt.ts
   ------------ */

module RobOS {
    export class Interrupt {
        constructor(public irq: number, public params: any[]) {
            this.irq = irq;
            this.params = params;
        }
    }
}
