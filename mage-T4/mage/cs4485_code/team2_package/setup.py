from setuptools import setup, find_packages

setup(
    name="data-introspection",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pandas>=1.5.0",
        "psycopg2-binary>=2.9.0",
    ],
    python_requires=">=3.7",
    author="Faris Kazi",
    author_email="fak200001@utdallas.edu",
    description="Data introspection module for CSV, SQLite, and PostgreSQL sources",
)