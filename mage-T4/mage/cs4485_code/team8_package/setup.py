from setuptools import setup, find_packages

setup(
    name='team8_package',
    version='0.1.0',
    description='Set up and manage alerts and notifications based on data trends.',
    author='Team 8',
    packages=find_packages(),
    install_requires=['fastapi', 'pydantic', 'sqlite3'],
    entry_points={
        'console_scripts': [
            'team8_package=team8_package.core:main'
        ]
    }
)