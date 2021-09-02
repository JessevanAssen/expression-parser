import { IdentifierExpression, ValueExpression } from './expression';
import { parse as prattParse } from './pratt-parser';
import { parse as recursiveDescentParse } from './recursive-descent-parser';

for (const [label, parse] of [['Pratt parser', prattParse], ['Recursive descent parser', recursiveDescentParse]] as const) {
	describe(label, () => {
		test('can parse values', () => {
			const actual = parse('12345');
			expect(actual).toEqual(NumberExpression(12345));
		});

		test('can parse identifiers', () => {
			const actual = parse('foo');
			expect(actual).toEqual(IdentifierExpression('foo'));
		})

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
					const actual = parse(`1 ${operator} 2 ${operator} 3 ${operator} 4`);
					expect(actual).toEqual({
						type: 'binary',
						left: {
							type: 'binary',
							left: {
								type: 'binary',
								left: NumberExpression(1),
								operator: expect.objectContaining({ lexeme: operator }),
								right: NumberExpression(2),
							},
							operator: expect.objectContaining({ lexeme: operator }),
							right: NumberExpression(3),
						},
						operator: expect.objectContaining({ lexeme: operator }),
						right: NumberExpression(4),
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

			test(`keeps correct precedence for '1 + 2 * 3'`, () => {
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

			test(`keeps correct precedence for '1 * 2 + 3'`, () => {
				const actual = parse('1 * 2 + 3');
				expect(actual).toEqual({
					type: 'binary',
					left: {
						type: 'binary',
						left: NumberExpression(1),
						operator: expect.objectContaining({ lexeme: '*' }),
						right: NumberExpression(2),
					},
					operator: expect.objectContaining({ lexeme: '+' }),
					right: NumberExpression(3),
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
	});
}

function NumberExpression(value: number): ValueExpression {
	return {
		type: 'value',
		value: { type: 'number', value, lexeme: String(value) },
	};
}

function IdentifierExpression(name: string): IdentifierExpression {
	return {
		type: 'identifier',
		name: { type: 'identifier', name, lexeme: name },
	}
}
