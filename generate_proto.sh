#!/bin/bash

# Directories
PROTO_DIR=./proto
OUT_DIR=./src/generated

# Clean up the previous generated files
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

# Generate protobuf files
protoc \
  --plugin=protoc-gen-es=./node_modules/.bin/protoc-gen-es \
  --plugin=protoc-gen-connect-es=./node_modules/.bin/protoc-gen-connect-es \
  -I . \
  --es_out $OUT_DIR \
  --es_opt target=ts \
  --connect-es_out $OUT_DIR \
  --connect-es_opt target=ts \
  $PROTO_DIR/epistemic_me.proto \
  $PROTO_DIR/models/*.proto

echo "Protobuf files generated in $OUT_DIR"

# Debug: List generated files
echo "Generated files:"
ls -R $OUT_DIR