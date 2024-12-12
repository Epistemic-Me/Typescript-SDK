#!/bin/bash

# Directories
PROTO_DIR=./proto
OUT_DIR=./src/generated

# Clean up the previous generated files
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

# Generate protobuf files
find $PROTO_DIR -name "*.proto" -print0 | xargs -0 protoc \
  --plugin=protoc-gen-es=./node_modules/.bin/protoc-gen-es \
  --plugin=protoc-gen-connect-es=./node_modules/.bin/protoc-gen-connect-es \
  --es_out=$OUT_DIR \
  --connect-es_out=$OUT_DIR

echo "Protobuf files generated in $OUT_DIR"

# Debug: List generated files
echo "Generated files:"
ls -R $OUT_DIR