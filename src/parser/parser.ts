import { OperatorToken, OperatorTokenType, scanTokens, ValueToken } from './lexer';

export type BinaryExpression = { type: 'binary', left: Expression, operator: OperatorToken, right: Expression };
export type UnaryExpression = { type: 'unary', operator: OperatorToken, right: Expression };
export type ValueExpression = { type: 'value', value: ValueToken };
export type Expression = BinaryExpression | UnaryExpression | ValueExpression;

export function parse(source: string): Expression {
	const tokens = scanTokens(source);
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

	function expression(): Expression {
		return addition();
	}

	function addition(): Expression {
		return binary(['plus', 'minus'], multiplication);
	}

	function multiplication(): Expression {
		return binary(['star', 'slash', 'remainder'], exponent);
	}

	function binary(operators: OperatorTokenType[], subExpression: () => Expression): Expression {
		let left = subExpression();

		while (!isAtEnd()) {
			const token = peek();
			if (!(operators as string[]).includes(token.type)) {
				break;
			}
			const operator = token as OperatorToken;

			advance();
			
			left = {
				type: 'binary',
				left,
				operator,
				right: subExpression(),
			}
		}
		
		return left;
	}

	function exponent(): Expression {
		let left = unary();

		while (!isAtEnd()) {
			const token = peek();
			if (token.type !== 'star-star') {
				break;
			}
			advance();

			left = {
				type: 'binary',
				left,
				operator: token,
				right: exponent(),
			};
		}

		return left;
	}

	function unary(): Expression {
		const token = peek();
		if (token.type === 'minus' || token.type === 'tilde') {
			advance();
			return { type: 'unary', operator: token, right: expression() };
		}

		return primary();
	}

	function primary(): Expression {
		const token = peek();
		if (token.type === 'left-paren') {
			advance();
			const inner = expression();
			advance();
			return inner;
		}

		return value();
	}

	function value(): ValueExpression {
		const token = peek();
		if (token.type === 'number') {
			advance();
			return { type: 'value', value: token };
		}
		throw new Error('Expect expression');
	}

	return expression();
}