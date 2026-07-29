# Python Patterns

## Purpose
Enforce idiomatic, type-safe Python 3.11+ conventions, PEP 8 standards, and high-performance practices.

## Apply when
Writing, reviewing, or refactoring Python code.

## Rules
- **Type Hints**: Type all function signatures and class attributes. Use `Protocol` for duck typing, `TypeVar`/`ParamSpec` for generics. Never use `Any` without justification. Mypy strict mode compliance is expected.
- **Error Handling**: Use EAFP (Easier to Ask Forgiveness than Permission). Catch specific exceptions. Use exception chaining (`raise ... from e`).
- **Resource Management**: Use context managers (`with`) for files, transactions, and timers.
- **Collections**: Use list/dict/set comprehensions for simple transformations. Use generators (`yield`) for lazy evaluation of large datasets.
- **Data Models**: Use `@dataclass` for mutable records, `NamedTuple` for immutable ones. Use `__slots__` for memory efficiency in large object collections. Use Pattern Matching (3.10+) for complex conditionals.
- **Concurrency**: Use `asyncio` for I/O-bound concurrency. Use `concurrent.futures.ThreadPoolExecutor` for blocking I/O and `ProcessPoolExecutor` for CPU bound tasks.
- **Testing**: TDD with `pytest`. Use `pytest-cov` (>90% target). Use `Hypothesis` for property-based testing.
- **Performance**: Profile with `cProfile`, `line_profiler`, or `memory_profiler`. Cache with `functools.lru_cache`. Use NumPy vectorization for numerical work.
- **Tooling**: Assume `black`, `isort`, `ruff`, `mypy`, and `bandit` (for security scanning). Use `poetry` or `pip-tools` for dependency management.

## Avoid
- Magic/implicit behavior.
- LBYL (Look Before You Leap) instead of `try`/`except`.
- Bare `except:` or `except Exception:`.
- Complex nested comprehensions (use generator functions instead).
- Mutable default arguments (use `None` and initialize inside the function).
- `type(obj) == list` (use `isinstance()`).
- `== None` (use `is None`).
- String concatenation in loops (use `"".join()`).
