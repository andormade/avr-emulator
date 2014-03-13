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

/**
 * ADIW – Add Immediate to Word
 *
 * Adds an immediate value (0 - 63) to a register pair and places the result in the register pair.
 * This instruction operates on the upper four register pairs,
 * and is well suited for operations on the pointer registers.
 * This instruction is not available in all devices. 
 * Refer to the device specific instruction set summary.
 *
 * @param Rd    d e {24,26,28,30}
 * @param Rr    0 <= K <= 63
 */
Avr.prototype.adiw = function(Rd, Rr) {

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * AND – Logical AND
 * 
 * Performs the logical AND between the contents of register Rd and register Rr 
 * and places the result in the destination register Rd.
 *
 * @param _Rd    Destination register
 * @param _Rr
 */
Avr.prototype.and = function(Rd, Rr) {

	/* Operation: Rd <- Rd && Rr */
	var r = this.dMem[Rd] &= this.dMem[Rr]; 

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * ANDI – Logical AND with Immediate
 * 
 * Performs the logical AND between the contents of register Rd and a constant 
 * and places the result in the destination register Rd.
 *
 * @param _Rd
 * @param K
 */
Avr.prototype.andi = function(Rd, K) {

	/* Operation: Rd <- Rd && K */
	var r = this.dMem[Rd] &= K;

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * ASR – Arithmetic Shift Right
 *
 * Shifts all bits in Rd one place to the right. Bit 7 is held constant.
 * Bit 0 is loaded into the C Flag of the SREG. 
 * This operation effectively divides a signed value by two without changing its sign.
 * The Carry Flag can be used to round the result.
 *
 * @param _Rd    0 <= d <= 31
 */
Avr.prototype.asr = function(Rd) {

	/* C: Set if, before the shift, the LSB of RD was set; cleared otherwise. */
	(this.dMem[Rd] & Avr.LSB)
		? this.dMem[this.SREG] |= Avr.SREG_C
		: this.dMem[this.SREG] &= ~ Avr.SREG_C;

	/* Operation */
	var r;

	/* @TODO */

	/* Z: Set if the result is $00; cleared otherwise. */
	(r == 0)
		? this.dMem[this.SREG] |= Avr.SREG_Z
		: this.dMem[this.SREG] &= ~Avr.SREG_Z;
	/* N: Set if MSB of the result is set; cleared otherwise. */
	(r & Avr.MSB) 
		? this.dMem[this.SREG] |= Avr.SREG_N
		: this.dMem[this.SREG] &= ~Avr.SREG_N;
	/* V: N ^ C (For N and C after the shift) */
	/* @TODO */
	/* S: N ^ V, For signed test */
	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/** 
 * BCLR – Bit Clear in SREG
 * 
 * Bit clear in SREG
 *
 * @param s
 */
Avr.prototype.bclr = function(s) {

	/* @TODO */
	this.dMem[this.SREG] &= ~(0x01 << s);

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * BLD – Bit Load from the T Flag in SREG to a Bit in Register
 *
 * Copies the T Flag in the SREG (Status Register) to bit b in register Rd.
 *
 * @param _Rd    0 <= d <= 31
 * @param b      0 <= b <= 7
 */
Avr.prototype.bld = function(Rd, b) {

	/* Operation: Rd(b) <- T */
	(this.dMem[this.SREG] & Avr.SREG_T)
		? this.dMem[Rd] |= 0x01 << b
		: this.dMem[Rd] &= ~(0x01 << b);  

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * BRBC – Branch if Bit in SREG is Cleared
 * 
 * Conditional relative branch.
 * Tests a single bit in SREG and branches relatively to PC if the bit is cleared. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * 
 * @param s
 * @param k
 */
Avr.prototype.brbc = function(s, k) {

	/* Operation: If SREG(s) = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_S) 
		? this.PC += (k + 1)
		: this.PC++; 
};

/**
 * BRBS – Branch if Bit in SREG is Set
 * 
 * Conditional relative branch. 
 * Tests a single bit in SREG and branches relatively to PC if the bit is set. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * 
 * @param s
 * @param k
 */
Avr.prototype.brbs = function(s, k) {

	/* Operation: If SREG(s) = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_S)
		? this.PC += (k + 1)
		: this.PC++;

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * BRCC – Branch if Carry Cleared
 * 
 * Conditional relative branch. 
 * Tests the Carry Flag (C) and branches relatively to PC if C is cleared. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBC 0,k).
 * 
 * @param k
 */
Avr.prototype.brcc = function(k) {

	/* Operation: If C = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_C) 
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRCS – Branch if Carry Set
 * 
 * Conditional relative branch. 
 * Tests the Carry Flag (C) and branches relatively to PC if C is set. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 0,k).
 * 
 * @param k
 */
Avr.prototype.brcs = function(k) {

	/* Operation: If C = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_C) 
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BREAK – Break
 * 
 * The BREAK instruction is used by the On-chip Debug system, and is normally not used in the application software. 
 * When the BREAK instruction is executed, the AVR CPU is set in the Stopped Mode. 
 * This gives the On-chip Debugger access to internal resources.
 * If any Lock bits are set, or either the JTAGEN or OCDEN Fuses are unprogrammed, 
 * the CPU will treat the BREAK instruction as a NOP and will not enter the Stopped mode.
 */
Avr.prototype['break'] = function() {

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * BRGE – Branch if Greater or Equal (Signed)
 * 
 * Conditional relative branch. 
 * Tests the Signed Flag (S) and branches relatively to PC if S is cleared. 
 * If the instruction is executed immediately after any of the instructions CP, CPI, SUB or SUBI,
 * the branch will occur if and only if the signed binary number represented in Rd was greater than or equal 
 * to the signed binary number represented in Rr. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * Equivalent to instruction BRBC 4,k).
 * 
 * @param {type} k
 */
Avr.protoype.brge = function(k) {

	/* Operation: If Rd ≥ Rr (N ⊕ V = 0) then PC <- PC + k + 1, else PC <- PC + 1 */

	/* @TODO */

	/* Program Counter: PC <- PC + 1 */
	this.PC++;
};

/**
 * BRHC – Branch if Half Carry Flag is Cleared
 * 
 * Conditional relative branch. 
 * Tests the Half Carry Flag (H) and branches relatively to PC if H is cleared. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBC 5,k).
 * 
 * @param k
 */
Avr.prototype.brhc = function(k) {

	/* Operation: If H = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_H)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRHS – Branch if Half Carry Flag is Set
 * 
 * Conditional relative branch. 
 * Tests the Half Carry Flag (H) and branches relatively to PC if H is set. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 5,k).
 * 
 * @param k
 */
Avr.protoype.brhs = function(k) {

	/* Operation: If H = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_H)
		? this.PC += (k + 1)
		: this.PC++;
};
