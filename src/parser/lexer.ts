export type PrefixOperatorTokenType = 'minus' | 'tilde' | 'bang' | 'left-paren';
export type InfixOperatorTokenType = 'plus' | 'minus' | 'star' | 'star-star' | 'slash' | 'remainder';
export type OperatorTokenType = PrefixOperatorTokenType | InfixOperatorTokenType | 'right-paren' | 'eof';
export type ValueTokenType = 'number';
export type TokenType = OperatorTokenType | ValueTokenType;

export type OperatorToken = { type: OperatorTokenType; lexeme: string };
export type NumberToken = { type: 'number', lexeme: string; value: number };
export type ValueToken = NumberToken;
export type Token = OperatorToken | ValueToken;

export function scanTokens(source: string): Token[] {
	let index = 0;

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
		return codePoint >= '0'.codePointAt(0)! && codePoint <= '9'.codePointAt(0)!;
	}

	function skipNumerics() {
		while (!isAtEnd() && isNumeric(peek())) {
			advance();
		}
	}

	function number(): NumberToken {
		let start = index;

		skipNumerics();
		if (peek() === '.') {
			advance();
			skipNumerics();
		}

		const lexeme = source.slice(start, index);
		return { type: 'number', lexeme, value: Number(lexeme) };
	}

	const tokens: Token[] = [];

	while (!isAtEnd()) {
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

				advance(); // Skip all unknown characters
		}
	}

	return tokens;
}
