import { Token } from './lexer';

export function TokenIterator(tokens: Token[]) {
	let index = 0;

	function isAtEnd() {
		return index >= tokens.length;
	}

	function peek(n = 0) {
		return tokens[index + n];
	}

	function advance() {
		return tokens[index++];
	}

	return { isAtEnd, peek, advance };
}
