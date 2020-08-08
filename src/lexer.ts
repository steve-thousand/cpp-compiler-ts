import { Token, TokenType } from './token';

export { Token, TokenType }

const WHITE_SPACE_REGEX = /^\s+$/;
const ID_OR_KEYWORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
const NUMBER_REGEX = /^[0-9]+$/;

class Lexer {
    private code: string;
    private index: number;

    constructor(code: string) {
        this.code = code;
        this.index = 0;
    }

    /**
     * Walk until we reach the next boundary word.
     * TODO: there's a lot of regex, can it be faster?
     */
    getTerm(): string {
        let startIndex = this.index;

        let first_char = this.code.substring(startIndex, startIndex + 1);
        //loop until we find a non-whitespace character
        while (WHITE_SPACE_REGEX.test(first_char)) {
            startIndex++;
            first_char = this.code.substring(startIndex, startIndex + 1);
        }

        let endIndex = startIndex + 1;

        //for the given character, what could this be? could it possibly be a keyword or identifier?
        if (ID_OR_KEYWORD_REGEX.test(first_char)) {
            //an identifier or keyword
            //walk until we find something that doesn't match regex
            while (true) {
                const substring = this.code.substring(startIndex, endIndex + 1);
                if (endIndex == this.code.length || !ID_OR_KEYWORD_REGEX.test(substring)) {
                    this.index = endIndex;
                    return this.code.substring(startIndex, endIndex);
                }
                endIndex++;
            }
        } else if (NUMBER_REGEX.test(first_char)) {
            //number!
            //walk until we find something that doesn't match regex
            while (true) {
                const substring = this.code.substring(startIndex, endIndex + 1);
                if (endIndex == this.code.length || !NUMBER_REGEX.test(substring)) {
                    this.index = endIndex;
                    return this.code.substring(startIndex, endIndex);
                }
                endIndex++;
            }
        } else {
            //for now, this is probably a non-alphanumeric token
            //walk until we find something that isn't a known constant token
            while (true) {
                const substring = this.code.substring(startIndex, endIndex + 1);
                if (endIndex == this.code.length || !Token.isConstantToken(substring)) {
                    this.index = endIndex;
                    return this.code.substring(startIndex, endIndex);
                }
                endIndex++;
            }
        }
    }

    getToken(): Token {
        while (this.index < this.code.length) {
            const term: string = this.getTerm();
            const constantToken = Token.isConstantToken(term);
            if (constantToken) {
                return constantToken;
            } else {
                const tokenType = NUMBER_REGEX.test(term) ? TokenType.LITERAL_INTEGER : TokenType.IDENTIFIER;
                return Token.ofTypeAndValue(tokenType, term);
            }
        }
    }

    //TODO: make this a stream of code to a stream of tokens
    public getTokens(): Token[] {
        const tokens = [];
        while (this.index != this.code.length) {
            tokens.push(this.getToken());
        }
        return tokens;
    }
}

export function lex(code: string): Token[] {
    const lexer = new Lexer(code);
    return lexer.getTokens();
}