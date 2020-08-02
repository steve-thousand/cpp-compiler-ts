import { assert, expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ProgramNode, FunctionDeclaration, Statement, ReturnStatement, Constant, UnaryOperation, UnaryOperator } from '../src/parser';


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
            assert.isTrue(returnStatement.expression instanceof Constant);

            const constant: Constant = <Constant>returnStatement.expression;
            expect(2).to.equal(constant.value);
        });

        it('Return unary negation', function () {
            const tokens = lex("int main() {\n\treturn -5;\n}");
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
            assert.isTrue(returnStatement.expression instanceof UnaryOperation);

            const unaryOperation: UnaryOperation = <UnaryOperation>returnStatement.expression;
            expect(UnaryOperator.NEGATION).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.expression);
            assert.isTrue(unaryOperation.expression instanceof Constant);

            const constant: Constant = <Constant>unaryOperation.expression;
            expect(5).to.equal(constant.value);
        });

        it('Return unary bitwise complement', function () {
            const tokens = lex("int main() {\n\treturn ~12;\n}");
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
            assert.isTrue(returnStatement.expression instanceof UnaryOperation);

            const unaryOperation: UnaryOperation = <UnaryOperation>returnStatement.expression;
            expect(UnaryOperator.BITWISE_COMPLEMENT).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.expression);
            assert.isTrue(unaryOperation.expression instanceof Constant);

            const constant: Constant = <Constant>unaryOperation.expression;
            expect(12).to.equal(constant.value);
        });

        it('Return unary logical negation', function () {
            const tokens = lex("int main() {\n\treturn !1;\n}");
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
            assert.isTrue(returnStatement.expression instanceof UnaryOperation);

            const unaryOperation: UnaryOperation = <UnaryOperation>returnStatement.expression;
            expect(UnaryOperator.LOGICAL_NEGATION).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.expression);
            assert.isTrue(unaryOperation.expression instanceof Constant);

            const constant: Constant = <Constant>unaryOperation.expression;
            expect(1).to.equal(constant.value);
        });
    });
});