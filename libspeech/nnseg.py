#!/usr/bin/python3

import sys
import nnsplit

# splitter = nnsplit.NNSplit("en")
splitter = nnsplit.NNSplit("en")
# NNSplit does not depend on proper punctuation and casing to split sentences
transcript = open(sys.argv[1], "r")
sentences = splitter.split([transcript.readline()])

for s in sentences:
    sbuf = ""
    for w in s:
        for subw in w:
            sbuf += (subw.text + subw.whitespace)
    print(sbuf)
    print("LINE_END")

# print(splitter.split(["This is a test This is another test."]))
