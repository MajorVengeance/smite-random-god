const expect = require('chai').expect;
const randomCommand = require('../commands/random-gods');

// include the list used to get the gods so we can do an accurate comparison
const godsList = require('../gods.json');

describe('selectRandomGod()', function() {
	it('should select a random god from a list with pantheon and class filters', function() {
		// 1. ARRANGE
		const args = { pantheon: ['mayan'], class: ['guardian'] };
		// there is currently only 1 Mayan Guardian, so we get an easy choice.
		const expectedResult = godsList.filter(god => god.id == 57).shift();
		// 2. ACT
		const randomGod = randomCommand.selectRandomGod(args);

		// 3. ASSERT
		expect(randomGod).to.be.equal(expectedResult);
	});
});

describe('selectRandomGod()', function() {
	it('should select a random god from a list with damage filter active', function() {
		// 1. ARRANGE
		const args = { damage: ['magical'] };
		const expectedResult = godsList.filter(god => god.damage.toLowerCase() == 'magical');
		// 2. ACT
		const randomGod = randomCommand.selectRandomGod(args);

		// 3. ASSERT
		expect(expectedResult).to.include(randomGod);
	});
});

describe('selectRandomGod()', function() {
	it('should select a random god from a list with range filter active', function() {
		// 1. ARRANGE
		const args = { range: ['melee'] };
		const expectedResult = godsList.filter(god => god.range.toLowerCase() == 'melee');
		// 2. ACT
		const randomGod = randomCommand.selectRandomGod(args);

		// 3. ASSERT
		expect(expectedResult).to.include(randomGod);
	});
});

describe('selectRandomGod()', function() {
	it('should select a random god from a list with pantheon filter active', function() {
		// 1. ARRANGE
		const args = { pantheon: ['egyptian'] };
		const expectedResult = godsList.filter(god => god.pantheon.toLowerCase() == 'egyptian');
		// 2. ACT
		const randomGod = randomCommand.selectRandomGod(args);

		// 3. ASSERT
		expect(expectedResult).to.include(randomGod);
	});
});

describe('selectRandomGod()', function() {
	it('should select a random god from a list with class filter active', function() {
		// 1. ARRANGE
		const args = { class: ['warrior'] };
		const expectedResult = godsList.filter(god => god.class.toLowerCase() == 'warrior');
		// 2. ACT
		const randomGod = randomCommand.selectRandomGod(args);

		// 3. ASSERT
		expect(expectedResult).to.include(randomGod);
	});
});

describe('selectRandomGod()', function() {
	it('should throw an exception about no gods in list', function() {
		// 1. ARRANGE
		const args = { class: ['mage'], damage: 'physical' };
		// 2. ACT
		// 3. ASSERT
		expect(() => randomCommand.selectRandomGod(args)).to.throw('your chosen filters have resulted in 0 gods being available. Please change your filters.');
	});
});