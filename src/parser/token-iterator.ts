import { Token, TokenType } from './lexer';

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

	function check(...type: TokenType[]): boolean {
		return type.some(t => peek()?.type === t);
	}

	return { isAtEnd, peek, advance, check };
}
