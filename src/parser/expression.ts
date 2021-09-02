import { IdentifierToken, OperatorToken, ValueToken } from './lexer';

export type BinaryExpression = { type: 'binary', left: Expression, operator: OperatorToken, right: Expression };
export type UnaryExpression = { type: 'unary', operator: OperatorToken, right: Expression };
export type ValueExpression = { type: 'value', value: ValueToken };
export type IdentifierExpression = { type: 'identifier', name: IdentifierToken };
export type Expression = BinaryExpression | UnaryExpression | ValueExpression | IdentifierExpression;
