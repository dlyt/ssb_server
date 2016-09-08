cmd_Release/des40.node := c++ -bundle -undefined dynamic_lookup -Wl,-search_paths_first -mmacosx-version-min=10.5 -arch x86_64 -L./Release  -o Release/des40.node Release/obj.target/des40/src/des40.o 
