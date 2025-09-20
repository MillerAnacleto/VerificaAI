# Makefile for VerificaAI server

# Default target
all: install

# Install dependencies
install:
	@echo "Creating virtual environment and installing dependencies..."
	uv venv
	uv sync

# Run the server
run:
	@echo "Starting server..."
	uv run uvicorn server:app --reload 

.PHONY: all install run
