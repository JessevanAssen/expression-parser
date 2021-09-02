export type PrefixOperatorTokenType = 'minus' | 'tilde' | 'bang' | 'left-paren';
export type InfixOperatorTokenType =
	'star-star' |
	'star' | 'slash' | 'remainder' |
	'plus' | 'minus' |
	'greater' | 'greater-equal' | 'less' | 'less-equal' |
	'equal-equal' | 'bang-equal' |
	'and' |
	'or' ;
export type OperatorTokenType = PrefixOperatorTokenType | InfixOperatorTokenType | 'right-paren' | 'eof';
export type ValueTokenType = 'number';
export type IdentifierTokenType = 'identifier';
export type TokenType = OperatorTokenType | ValueTokenType | IdentifierTokenType;

export type OperatorToken = { type: OperatorTokenType; lexeme: string };
export type NumberToken = { type: 'number', lexeme: string; value: number };
export type ValueToken = NumberToken;
export type IdentifierToken = { type: IdentifierTokenType, lexeme: string, name: string };
export type Token = OperatorToken | ValueToken | IdentifierToken;

export function scanTokens(source: string): Token[] {
	let index = 0;
	let start = index;

	const tokens: Token[] = [];

	function pushToken(type: OperatorTokenType) {
		tokens.push({ type, lexeme: source.slice(start, index) });
	};

	function isAtEnd() {
		return index >= source.length;
	}

	function peek(): string {
		return !isAtEnd() ?
			source[index] :
			'';
	}

	function advance() {
		return !isAtEnd() ?
			source[index++] :
			'';
	}

	function match(char: string) {
		if (peek() === char) {
			advance();
			return true;
		}
		return false;
	}

	function isNumeric(char: string) {
		const codePoint = char.codePointAt(0)!;
		return codePoint >= 0x30 && codePoint < 0x3a;
	}

	function skipNumerics() {
		while (!isAtEnd() && isNumeric(peek())) {
			advance();
		}
	}

	function number(): NumberToken {
		skipNumerics();
		if (peek() === '.') {
			advance();
			skipNumerics();
		}

		const lexeme = source.slice(start, index);
		return { type: 'number', lexeme, value: Number(lexeme) };
	}

	function isAlpha(char: string) {
		const codePoint = char.codePointAt(0)!;
		return codePoint >= 0x41 && codePoint <= 0x5a ||
			codePoint >= 0x61 && codePoint <= 0x7a ||
			char === '_';
	}

	function skipAlphaNumerics() {
		while(!isAtEnd() && (isAlpha(peek()) || isNumeric(peek()))) {
			advance();
		}
	}

	function identifier(): IdentifierToken {
		skipAlphaNumerics();
		const lexeme = source.slice(start, index);
		return { type: 'identifier', lexeme, name: lexeme };
	}

	while (!isAtEnd()) {
		start = index;
		const char = advance();

		switch (char) {
			case '-': pushToken('minus'); break;
			case '!': pushToken(match('=') ? 'bang-equal' : 'bang'); break;
			case '(': pushToken('left-paren'); break;
			case ')': pushToken('right-paren'); break;
			case '*': pushToken(match('*') ? 'star-star' : 'star'); break;
			case '/': pushToken('slash'); break;
			case '&': if (match('&')) pushToken('and'); break;
			case '%': pushToken('remainder'); break;
			case '+': pushToken('plus'); break;
			case '<': pushToken(match('=') ? 'less-equal' : 'less'); break;
			case '=': if (match('=')) pushToken('equal-equal'); break;
			case '>': pushToken(match('=') ? 'greater-equal' : 'greater'); break;
			case '|': if (match('|')) pushToken('or'); break;
			case '~': pushToken('tilde'); break;
			default:
				if (isNumeric(char)) {
					tokens.push(number());
					break;
				}

				if (isAlpha(char)) {
					tokens.push(identifier());
					break;
				}

				// Skip any whitespace and other unknown characters
		}
	}

	return tokens;
}
