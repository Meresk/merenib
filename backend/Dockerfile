FROM ubuntu:22.04

WORKDIR /root/

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY mn-bin .
RUN chmod +x mn-bin

EXPOSE 8080
CMD ["./mn-bin"]
