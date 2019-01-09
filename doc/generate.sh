#!/bin/bash

printf "Generating public API documentation\n"
raml2html --theme raml2html-slate-theme api.raml > api-slate.html &
pid=$! # Process Id of the previous running command

spin='-\|/'

i=0
while kill -0 $pid 2>/dev/null
do
  i=$(( (i+1) %4 ))
  printf "\r${spin:$i:1}"
  sleep .1
done
printf "\rDone ! Documentation can be found in doc/api-slate.html, open it in your browser.\n"