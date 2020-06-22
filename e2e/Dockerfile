FROM python:3.8-alpine AS base

# Runtime libraries for pg and psycopg
RUN apk update && apk add --no-cache postgresql-libs

FROM base AS build

# Dev tooling for building psycopg
RUN apk update && apk add --no-cache build-base postgresql-dev

# Build psycopg
RUN python -m venv .venv && \
    source .venv/bin/activate && \
    pip install --upgrade pip && \
    pip install psycopg2

FROM base AS runtime

COPY --from=build .venv /.venv
