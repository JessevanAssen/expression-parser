import { scanTokens, TokenType, OperatorTokenType } from './lexer';

test('Can scan tokens', () => {
	const tokens = scanTokens('1 + 2 * 3');
	const expected: TokenType[] = ['number', 'plus', 'number', 'star', 'number'];
	expect(tokens.map(t => t.type)).toEqual(expected);
});

describe('Operators', () => {
	const operators: [string, OperatorTokenType][] = [
		['+', 'plus'],
		['-', 'minus'],
		['~', 'tilde'],
		['!', 'bang'],
		['*', 'star'],
		['**', 'star-star'],
		['/', 'slash'],
		['%', 'remainder'],
		['(', 'left-paren'],
		[')', 'right-paren'],
	];
	for (const [lexeme, tokenType] of operators) {
		test(`Scans ${lexeme} to ${tokenType}`, () => {
			expect(scanTokens(lexeme)).toEqual([{ type: tokenType, lexeme }]);
		});
	}
});

describe('numbers', () => {
	test('parses integers', () => {
		expect(scanTokens('12345')).toEqual([{ type: 'number', lexeme: '12345', value: 12345 }]);
	});

	test('parses floats', () => {
		expect(scanTokens('123.456')).toEqual([{ type: 'number', lexeme: '123.456', value: 123.456 }]);
	});
});

test('parses identifiers', () => {
	const lexeme = 'Cool_Value_123'
	expect(scanTokens(lexeme)).toEqual([{ type: 'identifier', lexeme, name: lexeme }])
})
