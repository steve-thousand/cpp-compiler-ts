import { assert, expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ProgramNode, FunctionDeclaration, Statement, ReturnStatement, UnaryFactor, UnaryOperator, LiteralFactor, SimpleExpression, SimpleTerm } from '../src/parser';


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
            assert.isTrue(returnStatement.expression instanceof SimpleExpression);

            const simpleExpression: SimpleExpression = <SimpleExpression>returnStatement.expression;
            assert.isDefined(simpleExpression.term);
            assert.isTrue(simpleExpression.term instanceof SimpleTerm);

            const simpleTerm: SimpleTerm = <SimpleTerm>simpleExpression.term;
            assert.isDefined(simpleTerm.factor);
            assert.isTrue(simpleTerm.factor instanceof LiteralFactor);

            const constant: LiteralFactor = <LiteralFactor>simpleTerm.factor;
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
            assert.isTrue(returnStatement.expression instanceof SimpleExpression);

            const simpleExpression: SimpleExpression = <SimpleExpression>returnStatement.expression;
            assert.isDefined(simpleExpression.term);
            assert.isTrue(simpleExpression.term instanceof SimpleTerm);

            const simpleTerm: SimpleTerm = <SimpleTerm>simpleExpression.term;
            assert.isDefined(simpleTerm.factor);
            assert.isTrue(simpleTerm.factor instanceof UnaryFactor);

            const unaryOperation: UnaryFactor = <UnaryFactor>simpleTerm.factor;
            expect(UnaryOperator.NEGATION).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.factor);
            assert.isTrue(unaryOperation.factor instanceof LiteralFactor);

            const constant: LiteralFactor = <LiteralFactor>unaryOperation.factor;
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
            assert.isTrue(returnStatement.expression instanceof SimpleExpression);

            const simpleExpression: SimpleExpression = <SimpleExpression>returnStatement.expression;
            assert.isDefined(simpleExpression.term);
            assert.isTrue(simpleExpression.term instanceof SimpleTerm);

            const simpleTerm: SimpleTerm = <SimpleTerm>simpleExpression.term;
            assert.isDefined(simpleTerm.factor);
            assert.isTrue(simpleTerm.factor instanceof UnaryFactor);

            const unaryOperation: UnaryFactor = <UnaryFactor>simpleTerm.factor;
            expect(UnaryOperator.BITWISE_COMPLEMENT).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.factor);
            assert.isTrue(unaryOperation.factor instanceof LiteralFactor);

            const constant: LiteralFactor = <LiteralFactor>unaryOperation.factor;
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
            assert.isTrue(returnStatement.expression instanceof SimpleExpression);

            const simpleExpression: SimpleExpression = <SimpleExpression>returnStatement.expression;
            assert.isDefined(simpleExpression.term);
            assert.isTrue(simpleExpression.term instanceof SimpleTerm);

            const simpleTerm: SimpleTerm = <SimpleTerm>simpleExpression.term;
            assert.isDefined(simpleTerm.factor);
            assert.isTrue(simpleTerm.factor instanceof UnaryFactor);

            const unaryOperation: UnaryFactor = <UnaryFactor>simpleTerm.factor;
            expect(UnaryOperator.LOGICAL_NEGATION).to.equal(unaryOperation.operator);
            assert.isDefined(unaryOperation.factor);
            assert.isTrue(unaryOperation.factor instanceof LiteralFactor);

            const constant: LiteralFactor = <LiteralFactor>unaryOperation.factor;
            expect(1).to.equal(constant.value);
        });
    });
});