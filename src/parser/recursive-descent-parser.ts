import { OperatorToken, OperatorTokenType, scanTokens } from './lexer';
import { Expression } from './expression';
import { TokenIterator } from './token-iterator';

export function parse(source: string): Expression {
	const tokens = scanTokens(source);
	const iterator = TokenIterator(tokens);

	function expression(): Expression {
		return addition();
	}

	function addition(): Expression {
		return binary(['plus', 'minus'], multiplication);
	}

	function multiplication(): Expression {
		return binary(['star', 'slash', 'remainder'], exponent);
	}

	function binary(operators: OperatorTokenType[], parseHigherPrecedence: () => Expression): Expression {
		let left = parseHigherPrecedence();

		while (!iterator.isAtEnd()) {
			const token = iterator.peek();
			if (!(operators as string[]).includes(token.type)) {
				break;
			}
			const operator = token as OperatorToken;

			iterator.advance();

			left = {
				type: 'binary',
				left,
				operator,
				right: parseHigherPrecedence(),
			}
		}

		return left;
	}

	function exponent(): Expression {
		let left = unary();

		if (!iterator.isAtEnd()) {
			const token = iterator.peek();
			if (token.type === 'star-star') {
				iterator.advance();

				return {
					type: 'binary',
					left,
					operator: token,
					right: exponent(),
				};
			}
		}

		return left;
	}

	function unary(): Expression {
		const token = iterator.peek();
		if (token.type === 'minus' || token.type === 'tilde') {
			iterator.advance();
			return { type: 'unary', operator: token, right: expression() };
		}

		return primary();
	}

	function primary(): Expression {
		const token = iterator.peek();
		if (token.type === 'left-paren') {
			iterator.advance();
			const inner = expression();
			iterator.advance();
			return inner;
		}
		if (token.type === 'number') {
			iterator.advance();
			return { type: 'value', value: token };
		}
		if (token.type === 'identifier') {
			iterator.advance();
			return { type: 'identifier', name: token };
		}
		throw new Error('Expect expression');
	}

	return expression();
}
