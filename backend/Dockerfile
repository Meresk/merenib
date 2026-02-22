# Stage 1: Build
FROM golang:1.25 AS builder
WORKDIR /app

# Dependencies
COPY go.mod go.sum ./
RUN go mod download

# COPY and BUILD
COPY . .
RUN go build -o mn-bin cmd/main.go

# Stage 2: Production image
FROM debian:bookworm-slim
WORKDIR /root/

COPY --from=builder /app/mn-bin .

EXPOSE 8080
CMD ["./mn-bin"]