export type PrefixOperatorTokenType = 'minus' | 'tilde' | 'bang' | 'left-paren';
export type InfixOperatorTokenType = 'plus' | 'minus' | 'star' | 'star-star' | 'slash' | 'remainder';
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

	const tokens: Token[] = [];

	while (!isAtEnd()) {
		start = index;
		const char = peek();

		switch (char) {
			case '+': tokens.push({ type: 'plus', lexeme: char }); advance(); break;
			case '-': tokens.push({ type: 'minus', lexeme: char }); advance(); break;
			case '~': tokens.push({ type: 'tilde', lexeme: char }); advance(); break;
			case '!': tokens.push({ type: 'bang', lexeme: char }); advance(); break;
			case '*': {
				advance();
				if (match('*')) {
					tokens.push({ type: 'star-star', lexeme: '**' });
				} else {
					tokens.push({ type: 'star', lexeme: char });
				}
				break;
			}
			case '/': tokens.push({ type: 'slash', lexeme: char }); advance(); break;
			case '%': tokens.push({ type: 'remainder', lexeme: char }); advance(); break;
			case '(': tokens.push({ type: 'left-paren', lexeme: char }); advance(); break;
			case ')': tokens.push({ type: 'right-paren', lexeme: char }); advance(); break;
			default:
				if (isNumeric(char)) {
					tokens.push(number());
					break;
				}

				if (isAlpha(char)) {
					tokens.push(identifier());
					break;
				}

				advance(); // Skip all unknown characters
		}
	}

	return tokens;
}
