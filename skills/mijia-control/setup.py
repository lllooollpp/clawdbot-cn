from setuptools import setup, find_packages

setup(
    name="mijia-skills",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "mijiaAPI>=3.0.5",
    ],
    author="MijiaSkillBot",
    description="A universal AI agent skill pack for Mijia device control",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/lllooollpp/mijia-skills",
    python_requires=">=3.8",
)
