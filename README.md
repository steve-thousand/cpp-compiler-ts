# C++ Compiler written in Typescript

You don't need to read this stop reading this.

## Caveats

* you shouldn't use this
* it is currently hard coded for 64 bit architecture
* it only supports a subset of C++ features
* it breaks easily
* it is NOT optimized

## FAQ

1. why?
    * wanted to learn how compilers work
2. i will not be taking anymore questions

## Disclaimer

Did you read the part where I said you shouldn't use this?

Don't use this.

## Example:

Source C++

```
int fib(int n)
{
	if (n == 0 || n == 1)
	{
		return n;
	}
	else
	{
		return fib(n - 1) + fib(n - 2);
	}
}

int main()
{
	int n = 20;
	return fib(n);
}
```

Output assembly


```
 .globl _fib
_fib:
    push    %rbp
    mov     %rsp, %rbp
    mov     16(%rbp), %rax                 // `n` reference
    push    %rax
    mov     $0, %rax
    mov     %rax, %rcx
    pop     %rax
    cmp     %rcx, %rax
    mov     $0, %rax
    sete    %al                            // ==
    push    %rax
    mov     16(%rbp), %rax                 // `n` reference
    push    %rax
    mov     $1, %rax
    mov     %rax, %rcx
    pop     %rax
    cmp     %rcx, %rax
    mov     $0, %rax
    sete    %al                            // ==
    mov     %rax, %rcx
    pop     %rax
    cmp     $0, %rax                       // || start
    je      _clause_2                      // || short circuit
    mov     $1, %rax
    jmp     _end_2
_clause_2:
    mov     %rcx, %rax
    cmp     $0, %rax
    mov     $0, %rax
    setne   %al                            // || end
_end_2:
    cmp     $0, %rax                       // if
    je      _else_1                        // false
    mov     16(%rbp), %rax                 // `n` reference
    jmp     _fib_return
    jmp     _post_conditional_1            // if done
_else_1:
    mov     16(%rbp), %rax                 // `n` reference
    push    %rax
    mov     $1, %rax
    mov     %rax, %rcx
    pop     %rax
    sub     %rcx, %rax                     // -
    push    %rax
    call    _fib
    add     $8, %rsp
    push    %rax
    mov     16(%rbp), %rax                 // `n` reference
    push    %rax
    mov     $2, %rax
    mov     %rax, %rcx
    pop     %rax
    sub     %rcx, %rax                     // -
    push    %rax
    call    _fib
    add     $8, %rsp
    mov     %rax, %rcx
    pop     %rax
    add     %rcx, %rax                     // +
    jmp     _fib_return
_post_conditional_1:
_fib_return:
    mov     %rbp, %rsp
    pop     %rbp
    ret     
 .globl _main
_main:
    push    %rbp
    mov     %rsp, %rbp
    sub     $8, %rsp                       // allocate `n`, 8 bytes
    mov     $20, %rax
    mov     %rax, -8(%rbp)                 // `n` assignment
    mov     -8(%rbp), %rax                 // `n` reference
    push    %rax
    call    _fib
    add     $8, %rsp
    jmp     _main_return
_main_return:
    add     $8, %rsp                       // deallocate 8 bytes
    mov     %rbp, %rsp
    pop     %rbp
    ret     
```