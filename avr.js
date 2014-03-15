var Avr = function(config) {
	
	this.dMem = new Uint8Array(config['dataMemorySize']);
	this.pMem = new Uint8Array(config['programMemorySize']);

	this.SREG = config['SREGAddress'];

	this.enabledFunctions = config['enabledFunctions'];

	this.PC = 0;
}

Avr.prototype.loadProgram = function(base64) {

	var raw = window.atob(base64);

 	for (i = 0; i < raw.length; i++) {
 		this.pMem[i] = raw.charCodeAt(i);
 	}
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

/** Mask for MSB */
Avr.MSB = 0x80;
/** Mask for LSB */
Avr.LSB = 0x01;

/** Opcodes */
Avr.OPCODES = {
	'000111rdddddrrrr': 'adc',
	'000011rdddddrrrr': 'add',
	'10010110KKddKKKK': 'adiw',
	'001000rdddddrrrr': 'and',
	'0111KKKKddddKKKK': 'andi',
	'1001010ddddd0101': 'asr',
	'100101001sss1000': 'bclr',
	'1111100ddddd0bbb': 'bld',
	'111101kkkkkkksss': 'brbc',
	'111100kkkkkkksss': 'brbs',
	'111101kkkkkkk000': 'brcc',
	'111100kkkkkkk000': 'brcs',
	'1001010110011000': 'break',
	'111100kkkkkkk001': 'breq',
	'111101kkkkkkk100': 'brge',
	'111101kkkkkkk101': 'brhc',
	'111100kkkkkkk101': 'brhs',
	'111101kkkkkkk111': 'brid',
	'111100kkkkkkk111': 'brie',
	'111100kkkkkkk000': 'brlo',
	'111100kkkkkkk100': 'brlt',
	'111100kkkkkkk010': 'brmi',
	'111101kkkkkkk001': 'brne',
	'111101kkkkkkk010': 'brpl',
	'111101kkkkkkk000': 'brsh',
	'111101kkkkkkk110': 'brtc',
	'111100kkkkkkk110': 'brts',
	'111101kkkkkkk011': 'brvc',
	'111100kkkkkkk011': 'brvs',
	'100101000sss1000': 'bset',
	'1111101ddddd0bbb': 'bst'
};

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
Avr.prototype.brhs = function(k) {

	/* Operation: If H = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_H)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRID – Branch if Global Interrupt is Disabled
 * 
 * Conditional relative branch. 
 * Tests the Global Interrupt Flag (I) and branches relatively to PC if I is cleared. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBC 7,k).
 * 
 * @param k
 */
Avr.protoype.brid = function(k) {

	/* If I = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_I)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRIE – Branch if Global Interrupt is Enabled
 * 
 * Conditional relative branch. 
 * Tests the Global Interrupt Flag (I) and branches relatively to PC if I is set.
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 7,k).
 * 
 * @param k
 */
Avr.protoype.brie = function(k) {

	/* If I = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_I)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRLO – Branch if Lower (Unsigned)
 * 
 * Conditional relative branch. 
 * Tests the Carry Flag (C) and branches relatively to PC if C is set. 
 * If the instruction is executed immediately after any of the instructions CP, CPI, SUB or SUBI, 
 * the branch will occur if and only if the unsigned binary number represented in Rd was smaller 
 * than the unsigned binary number represented in Rr. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * (Equivalent to instruction BRBS 0,k).
 * 
 * @param k
 */
Avr.protoype.brlo = function(k) {

	/* Operation: If Rd < Rr (C = 1) then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_C)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRLT – Branch if Less Than (Signed)
 * 
 * Conditional relative branch. 
 * Tests the Signed Flag (S) and branches relatively to PC if S is set. 
 * If the instruction is executed immediately after any of the instructions CP, CPI, SUB or SUBI, 
 * the branch will occur if and only if the signed binary number represented in Rd was less 
 * than the signed binary number represented in Rr.
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 4,k).
 * 
 * @param k
 */
Avr.protoype.brlt = function(k) {

	/* Operation: If Rd < Rr (N ⊕ V = 1) then PC ← PC + k + 1, else PC ← PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_S)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRMI – Branch if Minus
 * 
 * Conditional relative branch. 
 * Tests the Negative Flag (N) and branches relatively to PC if N is set. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 2,k).
 * 
 * @param k
 */
Avr.prototype.brmi = function(k) {

	/* If N = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_N)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRNE – Branch if Not Equal
 * 
 * Conditional relative branch. 
 * Tests the Zero Flag (Z) and branches relatively to PC if Z is cleared. 
 * If the instruction is executed immediately after any of the instructions CP, CPI, SUB or SUBI, 
 * the branch will occur if and only if the unsigned or signed binary number represented in Rd was not equal 
 * to the unsigned or signed binary number represented in Rr. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * (Equivalent to instruction BRBC 1,k).
 * 
 * @param k
 */
Avr.prototype.brne = function(k) {

	/* If Rd != Rr (Z = 0) then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_Z)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRPL – Branch if Plus
 * 
 * Conditional relative branch.
 * Tests the Negative Flag (N) and branches relatively to PC if N is cleared.
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is brepresented in two’s complement form.
 * (Equivalent to instruction BRBC 2,k).
 * 
 * @param k
 */
Avr.prototype.brpl = function(k) {

	!(this.dMem[this.SREG] & Avr.SREG_N)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRSH – Branch if Same or Higher (Unsigned)
 * 
 * Conditional relative branch. 
 * Tests the Carry Flag (C) and branches relatively to PC if C is cleared.
 * If the instruction is executed immediately after execution of any of the instructions CP, CPI, SUB or SUBI,
 * the branch will occur if and only if the unsigned binary number represented in Rd was greater than or equal
 * to the unsigned binary number represented in Rr. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * (Equivalent to instruction BRBC 0,k).
 *
 * @param k
 */
Avr.prototype.brsh = function(k) {

	/* Operation: If Rd >= Rr (C = 0) then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_C)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRTC – Branch if the T Flag is Cleared
 * 
 * Conditional relative branch. 
 * Tests the T Flag and branches relatively to PC if T is cleared. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * (Equivalent to instruction BRBC 6,k).
 * 
 * @param k
 */
Avr.prototype.brtc = function(k) {

	/* Operation: If T = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_T)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRTS – Branch if the T Flag is Set
 * 
 * Conditional relative branch. 
 * Tests the T Flag and branches relatively to PC if T is set.
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64).
 * The parameter k is the offset from PC and is represented in two’s complement form.
 * (Equivalent to instruction BRBS 6,k).
 * 
 * @param k
 */
Avr.prototype.brts = function(k) {

	/* Operation: If T = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_T)
		? this.PC += (k + 1)
		: this.PC++;
};

/** 
 * BVRC - Branch if Overflow Cleared
 * 
 * Conditional relative branch. 
 * Tests the Overflow Flag (V) and branches relatively to PC if V is cleared.
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBC 3,k).
 * 
 * @param k
 */
Avr.prototype.brvc = function(k) {

	/* Operation: If V = 0 then PC <- PC + k + 1, else PC <- PC + 1 */
	!(this.dMem[this.SREG] & Avr.SREG_V)
		? this.PC += (k + 1)
		: this.PC++;
};

/**
 * BRVS – Branch if Overflow Set
 *
 * Conditional relative branch. 
 * Tests the Overflow Flag (V) and branches relatively to PC if V is set. 
 * This instruction branches relatively to PC in either direction (PC - 63 ≤ destination ≤ PC + 64). 
 * The parameter k is the offset from PC and is represented in two’s complement form. 
 * (Equivalent to instruction BRBS 3,k)
 *
 * @param k
 */
Avr.prototype.brvs = function(k) {

	/** Operation: If V = 1 then PC <- PC + k + 1, else PC <- PC + 1 */
	(this.dMem[this.SREG] & Avr.SREG_V)
		? this.PC += (k + 1)
		: this.PC++;
};
