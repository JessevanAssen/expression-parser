import { IdentifierToken, NumberToken, OperatorToken, scanTokens, Token, TokenType } from './lexer';
import { Expression } from './expression';
import { TokenIterator } from './token-iterator';

export function parse(source: string): Expression {
	const tokens = scanTokens(source);
	const iterator = TokenIterator(tokens);

	type PrefixParselet = {
		parse: (token: Token) => Expression;
	};
	const prefixParselets: Partial<Record<TokenType, PrefixParselet>> = {
		identifier: { parse: token => ({ type: 'identifier', name: token as IdentifierToken })},
		number: { parse: token => ({ type: 'value', value: token as NumberToken }) },
		'left-paren': { parse: () => {
			const inner = expression();
			iterator.advance();
			return inner;
		} },
		minus: Unary(),
		tilde: Unary(),
		bang: Unary(),
	};

	function Unary(): PrefixParselet {
		return {
			parse: token => ({ type: 'unary', operator: token as OperatorToken, right: expression() }),
		};
	}

	function getPrefixParselet(token: Token): PrefixParselet {
		if (!(token.type in prefixParselets)) {
			throw new Error(`Could not parse '${token.lexeme}'`);
		}
		return prefixParselets[token.type]!;
	}

	type InfixParselet = {
		precedence: number;
		parse: (left: Expression, token: OperatorToken) => Expression;
	};
	const infixParselets: Partial<Record<TokenType, InfixParselet>> = {
		'star-star': Binary(16, { rightAssociative: true }),
		'star': Binary(15),
		'slash': Binary(15),
		'remainder': Binary(15),
		'plus': Binary(14),
		'minus': Binary(14),
		'less': Binary(12),
		'less-equal': Binary(12),
		'greater': Binary(12),
		'greater-equal': Binary(12),
		'equal-equal': Binary(11),
		'bang-equal': Binary(11),
		'and': Binary(7),
		'or': Binary(6),
	}

	function Binary(precedence: number, { rightAssociative = false } = {}): InfixParselet {
		return {
			precedence,
			parse: (left, token): Expression => {
				const p = rightAssociative ? precedence - 0.1 : precedence;
				const right = expression(p);
				return {
					type: 'binary',
					left,
					operator: token,
					right,
				};
			},
		};
	}

	function getInfixParselet(token: Token): InfixParselet | null {
		return infixParselets[token.type] ?? null;
	}

	function expression(precedence = 0): Expression {
		const token = iterator.advance();
		const prefix = getPrefixParselet(token);

		let left = prefix.parse(token);

		while (!iterator.isAtEnd()) {
			const infix = getInfixParselet(iterator.peek());
			if (infix === null || infix.precedence <= precedence) {
				break;
			}
			const operator = iterator.advance() as OperatorToken;
			left = infix.parse(left, operator);
		}

		return left;
	}

	return expression();
}
