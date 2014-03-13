var Avr = function(config) {
	
	this.dMem = new Uint8Array(config['dataMemorySize']);
	this.pMem = new Uint8Array(config['programMemorySize']);

	this.SREG = config['SREGAddress'];

	this.PC = 0;
}

/* C - Carry flag */
Avr.SREG_C = 0x01;
/* Z - Zero flag */
Avr.SREG_Z = 0x02;
/* N - Negative Flag */
Avr.SREG_N = 0x04;
/* V - Two's Complement Overflow Flag */
Avr.SREG_V = 0x08;
/* S - Sign Bit */
Avr.SREG_S = 0x10;
/* H - Half Carry Flag */
Avr.SREG_H = 0x20;
/* T - Bit Copy Storage */
Avr.SREG_T = 0x40;
/* I - Global interrupt enable */
Avr.SREG_I = 0x80;

Avr.MSB = 0x80;
Avr.LSB = 0x01;



/**
 * ADC – Add with Carry
 * 
 * Adds two registers and the contents of the C Flag and places the result in the destination register Rd.
 * 
 * @param Rd    0 < d < 31
 * @param Rr    0 < r < 31
 */
Avr.prototype.adc = function(Rd, Rr) {

	/* Operation: Rd <- Rd + Rr + C */
	var r = this.dMem[Rd] = (
		this.dMem[Rd] + this.dMem[Rr] 
		+ (
			this.dMem[this.SREG] & Avr.SREG_C
		)
	);

	/* C: Set if there was carry from the MSB of the result; cleared otherwise. */
	(r > 255) 
		? this.dMem[this.SREG] |= Avr.SREG_C
		: this.dMem[this.SREG] &= ~ Avr.SREG_C;
	/* Z: Set if the result is $00; cleared otherwise. */
	(r == 0)
		? this.dMem[this.SREG] |= Avr.SREG_Z
		: this.dMem[this.SREG] &= ~Avr.SREG_Z;
	/* N: Set if MSB of the result is set; cleared otherwise. */
	(r & Avr.MSB) 
		? this.dMem[this.SREG] |= Avr.SREG_N
		: this.dMem[this.SREG] &= ~Avr.SREG_N;
	/* V: Set if two’s complement overflow resulted from the operation; cleared otherwise. */
	/* S: N ^ V, For signed tests. */
	/* H: Set if there was a carry from bit 3; cleared otherwise. */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * ADD – Add without Carry
 * 
 * Adds two registers without the C Flag and places the result in the destination register Rd
 * 
 * @param Rd    0 < d < 31
 * @param Rr    0 < r < 31
 */
Avr.prototype.add = function(Rd, Rr) {

	/* Operation: Rd <- Rd + Rr */
	var r = this.dMem[Rd] += this.dMem[Rd];

	/* C: Set if there was carry from the MSB of the result; cleared otherwise. */
	(r > 255) 
		? this.dMem[this.SREG] |= Avr.SREG_C
		: this.dMem[this.SREG] &= ~ Avr.SREG_C;
	/* Z: Set if the result is $00; cleared otherwise. */
	(r == 0)
		? this.dMem[this.SREG] |= Avr.SREG_Z
		: this.dMem[this.SREG] &= ~Avr.SREG_Z;
	/* N: Set if MSB of the result is set; cleared otherwise. */
	(r & Avr.MSB) 
		? this.dMem[this.SREG] |= Avr.SREG_N
		: this.dMem[this.SREG] &= ~Avr.SREG_N;
	/* V: Set if two’s complement overflow resulted from the operation; cleared otherwise. */
	/* S: N ^ V, For signed tests. */
	/* H: Set if there was a carry from bit 3; cleared otherwise. */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};
