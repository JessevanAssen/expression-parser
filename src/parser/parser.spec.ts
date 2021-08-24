import { parse, ValueExpression } from './parser';

test('can parse values', () => {
	const actual = parse('12345');
	expect(actual).toEqual(NumberExpression(12345));
});

describe('can parse unary expressions', () => {
	const operators = ['-', '~'];
	for (const operator of operators) {
		test(operator, () => {
			const actual = parse(`${operator}1`);
			expect(actual).toEqual({
				type: 'unary',
				operator: expect.objectContaining({ lexeme: operator }),
				right: NumberExpression(1),
			});
		})
	}	
});


describe('can parse binary expressions', () => {
	const operators = ['**', '*', '/', '%', '+', '-'];
	for (const operator of operators) {
		test(operator, () => {
			const actual = parse(`1 ${operator} 2`);
			expect(actual).toEqual({
				type: 'binary',
				left: NumberExpression(1),
				operator: expect.objectContaining({ lexeme: operator }),
				right: NumberExpression(2),
			});
		})
	}

	for (const operator of ['*', '/', '+', '-']) {
		test(`is left-associative for '${operator}'`, () => {
			const actual = parse(`1 ${operator} 2 ${operator} 3`);
			expect(actual).toEqual({
				type: 'binary',
				left: { 
					type: 'binary',
					left: NumberExpression(1),
					operator: expect.objectContaining({ lexeme: operator }),
					right: NumberExpression(2),
				},
				operator: expect.objectContaining({ lexeme: operator }),
				right: NumberExpression(3),
			});
		});
	}

	test(`is right-associative for '**'`, () => {
		const actual = parse(`1 ** 2 ** 3`);
		expect(actual).toEqual({
			type: 'binary',
			left: NumberExpression(1),
			operator: expect.objectContaining({ lexeme: '**' }),
			right: { 
				type: 'binary',
				left: NumberExpression(2),
				operator: expect.objectContaining({ lexeme: '**' }),
				right: NumberExpression(3),
			},
		});
	});

	test('keeps correct precedence for multiplication and addition', () => {
		const actual = parse('1 + 2 * 3');
		expect(actual).toEqual({
			type: 'binary',
			left: NumberExpression(1),
			operator: expect.objectContaining({ lexeme: '+' }),
			right: { 
				type: 'binary',
				left: NumberExpression(2),
				operator: expect.objectContaining({ lexeme: '*' }),
				right: NumberExpression(3),
			},
		});
	});

	test('keeps correct precedence for exponents', () => {
		const actual = parse('1 ** 2 * 3');
		expect(actual).toEqual({
			type: 'binary',
			left: { 
				type: 'binary',
				left: NumberExpression(1),
				operator: expect.objectContaining({ lexeme: '**' }),
				right: NumberExpression(2),
			},
			operator: expect.objectContaining({ lexeme: '*' }),
			right: NumberExpression(3),
		});
	});
});

test('supports grouping', () => {
	const actual = parse('(1 + 2) * (3 + 4)');
	expect(actual).toEqual({
		type: 'binary',
		left: { 
			type: 'binary',
			left: NumberExpression(1),
			operator: expect.objectContaining({ lexeme: '+' }),
			right: NumberExpression(2),
		},
		operator: expect.objectContaining({ lexeme: '*' }),
		right: { 
			type: 'binary',
			left: NumberExpression(3),
			operator: expect.objectContaining({ lexeme: '+' }),
			right: NumberExpression(4),
		},
	});
});

function NumberExpression(value: number): ValueExpression {
	return { 
		type: 'value',
		value: { type: 'number', value, lexeme: String(value) },
	};
}