import { assert, expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ProgramNode, FunctionDeclaration, Statement, ReturnStatement, Expression, Constant } from '../src/parser';


describe('parser', function () {
    describe('parser()', function () {
        it('A simple case', function () {
            const tokens = lex("int main() {\n\treturn 2;\n}");
            const ast = parse(tokens);

            assert.isDefined(ast);
            assert.isDefined(ast.programNode);

            const programNode: ProgramNode = ast.programNode
            assert.isDefined(programNode.mainFunction);

            const mainFunction: FunctionDeclaration = programNode.mainFunction;
            expect("main").to.equal(mainFunction.name);

            const statements: Statement[] = mainFunction.statements;
            expect(1).to.equal(statements.length);
            assert.isTrue(statements[0] instanceof ReturnStatement);

            const returnStatement: ReturnStatement = <ReturnStatement>statements[0];
            assert.isDefined(returnStatement.expression);

            const expression: Expression = returnStatement.expression;
            assert.isDefined(expression.constant);

            const constant: Constant = expression.constant;
            expect(2).to.equal(constant.value);
        });
    });
});