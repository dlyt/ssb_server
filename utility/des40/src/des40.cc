#include <stdio.h>
#include <string.h>
#include <node.h>
#include <node_buffer.h>


#define Bit unsigned char

using namespace v8;

/* 初置换 */
static int IP[40] = {
     34 , 26 , 18 , 10 ,  2 ,
     36 , 28 , 20 , 12 , 38 ,
      4 , 30 , 22 ,  6 , 14 ,
     40 , 32 , 24 ,  8 , 16 ,
     33 , 25 , 17 ,  9 ,  1 ,
     35 , 19 , 27 , 11 ,  3 ,
     37 , 29 , 21 , 13 ,  5 ,
     39 , 31 , 23 , 15 ,  7 };


/* 末置换 */
static int FP[40] = {
    25 ,  5 , 30 , 11 , 35 ,
    14 , 40 , 19 , 24 ,  4 ,
    29 ,  9 , 34 , 15 , 39 ,
    20 , 23 ,  3 , 27 ,  8 ,
    33 , 13 , 38 , 18 , 22 ,
     2 , 28 ,  7 , 32 , 12 ,
    37 , 17 , 21 ,  1 , 26 ,
     6 , 31 , 10 , 36 , 16 };


/* 密钥置换 */
static int KP[40] = {
     40 ,  22 ,  16 , 33 , 25 , 17 ,  9 ,  1 ,
      8 ,  32 ,  30 , 34 , 26 , 18 , 10 ,  2 ,
     24 ,  14 ,   6 , 35 , 27 , 19 , 11 ,  3 ,
     37 ,  29 ,  21 , 36 , 13 ,  5 , 28 , 39 ,
     31 ,  23 ,  15 ,  7 , 20 , 12 ,  4 , 38 };


/* 密钥位移 共移动 40/2 Bit位 */
static int KM[16] = {
    1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,  1 ,
    1 ,  1 ,  1 ,  1 ,  2 ,  2 ,  2 ,  2};


/* 压缩置换 */
static int CP[30] = {
    1 ,   2 ,  32 ,   4 ,   5 ,   6 ,
    7 ,   8 ,   9 ,  10 ,  11 ,  12 ,
   13 ,  14 ,  31 ,  16 ,  17 ,  18 ,
   39 ,  20 ,  21 ,  22 ,  33 ,  24 ,
   25 ,  36 ,  27 ,  28 ,  29 ,  30 };


//* 扩展置换 */
static int EP [30] = {
    1 ,   2 ,   3 ,   4 ,   3 ,   4 ,
    5 ,   6 ,   7 ,   8 ,   7 ,   8 ,
    9 ,  10 ,  11 ,  12 ,  11 ,  12 ,
   13 ,  14 ,  15 ,  16 ,  15 ,  16 ,
   17 ,  18 ,  19 ,  20 ,  19 ,  20 };


/* S盒 只使用 S1-S5 */
static int S_box[8][4][16] = {
        /* S1 */
       {{14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7},
        {0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8},
        {4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0},
        {15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13}},
        /* S2 */
       {{15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10},
        {3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5},
        {0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15},
        {13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9}},
        /* S3 */
       {{10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8},
        {13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1},
        {13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7},
        {1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12}},
        /* S4 */
       {{7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15},
        {13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9},
        {10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4},
        {3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14}},
        /* S5 */
       {{2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9},
        {14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6},
        {4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14},
        {11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3}},
        /* S6 */
       {{12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11},
        {10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8},
        {9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6},
        {4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13}},
        /* S7 */
       {{4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1},
        {13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6},
        {1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2},
        {6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12}},
        /* S8 */
       {{13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7},
        {1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2},
        {7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8},
        {2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11}}
};

/* P盒 */
static int PP[20] = {
    7 ,  16 ,  20 ,  12 ,  17 ,
    1 ,  15 ,   5 ,  18 ,  10 ,
    2 ,   8 ,  14 ,   3 ,   9 ,
    19 , 13 ,   6 ,  11 ,   4 };


static
void des40_initial(Bit pt[40])
{
    Bit tmp[40] = {0};
    for(int i = 0;i < 40;i++)
        tmp[i] = pt[IP[i] - 1];
    memcpy(pt, tmp, sizeof(tmp));
}


static
void des40_final(Bit pt[40])
{
    Bit tmp[40] = {0};
    for(int i = 0;i < 40;i++)
        tmp[i] = pt[FP[i] - 1];
    memcpy(pt, tmp, sizeof(tmp));
}


static
void des40_pbox(Bit x[20])
{
    Bit tmp[20] = {0};
    for(int i = 0;i < 20;i++)
        tmp[i] = x[PP[i]-1];
    memcpy(x, tmp, sizeof(tmp));
}


static
void des40_genkey(char raw[5], Bit out[16][30], int dir)
{
	Bit org[40] = {0};
	Bit swap[40] = {0};

    for(int i = 0;i < 5;i++)
        for(int j = 7;j >= 0;j--)
            org[i * 8 + (7 - j)] = (raw[i] >> j) & 1;

    for (int i = 0; i < 40; i++)
        swap[i] = org[KP[i] - 1];

    int st = 0;
    for(int i = 0; i < 16; i++) {
        st += KM[i];
        int p = dir ? i : (15 - i);
        for(int j = 0; j < 30; j++)
            out[p][j] = swap[(CP[j] - 1 + st) % 40];
    }
}


static
void des40_rotate(Bit L[20], Bit R[20], Bit key[30], int cnt)
{
    Bit group[30] = {0};
    Bit half[20] = {0};
    Bit swap[20] = {0};

    for(int i = 0; i < 30; i++)
        group[i] = R[EP[i]-1] ^ key[i];

    for(int i = 0; i < 5; i++) {
        int st; /* cursor */
        st = i * 6;
        int row = (group[st] << 1) + group[st + 5];
        int col = (group[st + 1] << 3) + (group[st + 2] << 2) + (group[st + 3] << 1) + group[st + 4];
        int value = S_box[i][row][col];
        st = i * 4;
        for(int j = 0; j < 4; j++)
            half[st + (3 - j)] |= (value >> j) & 1;
    }

    des40_pbox(half);

    for(int i = 0; i < 20; i++)
        L[i] ^= half[i];

    if (cnt == 15) return;

    memcpy(swap, L, sizeof(swap));
    memcpy(L, R, sizeof(swap));
    memcpy(R, swap, sizeof(swap));
}


void des40_update(char raw[5], Bit keys[16][30], char out[5]) {
    Bit L[20] = {0};
    Bit R[20] = {0};
    Bit pt[40];

    for(int i = 0; i < 5; i++)
        for(int j = 7; j >= 0; j--)
            pt[i * 8 + (7 - j)] = (raw[i] >> j) & 1;

    des40_initial(pt);

    for(int i = 0; i < 20; i++)
        L[i] = pt[i], R[i] = pt[i + 20];

    for(int i = 0; i < 16; i++)
        des40_rotate(L, R, keys[i], i);

    for(int i = 0; i < 20; i++)
        pt[i] = L[i], pt[i + 20] = R[i];

    des40_final(pt);

    for(int i = 0; i < 5; i++)
        for(int j = 7; j >= 0; j--)
            out[i] |= pt[i * 8 + (7 - j)] << j;

    return ;
}


static
void v8_des40(const FunctionCallbackInfo<Value>& args, int dir) {
	Isolate* isolate = args.GetIsolate();
	v8::HandleScope scope(isolate);

	if (!args[0]->IsArrayBufferView())
		return;

    if (!args[1]->IsArrayBufferView())
		return;

	auto raw_view = args[0].As<v8::ArrayBufferView>();
  	auto raw_offset = raw_view->ByteOffset();
  	auto raw_length = raw_view->ByteLength();
	assert(raw_view->HasBuffer());
	auto raw_buffer = raw_view->Buffer();
	auto raw_contents = raw_buffer->GetContents();
	char* raw = static_cast<char*>(raw_contents.Data()) + raw_offset;

	if (raw_length != 5)
        return;

	auto key_view = args[1].As<v8::ArrayBufferView>();
	auto key_offset = key_view->ByteOffset();
	auto key_length = key_view->ByteLength();
	assert(key_view->HasBuffer());
	auto key_buffer = key_view->Buffer();
	auto key_contents = key_buffer->GetContents();
	char* key = static_cast<char*>(key_contents.Data()) + key_offset;

	if (key_length != 5)
		return;

	Bit keys[16][30] = {{0}};
	char out[5] = {0};

    des40_genkey(key, keys, dir);
    des40_update(raw, keys, out);

	auto result = node::Buffer::Copy(isolate,
                                reinterpret_cast<const char*>(out),
                                sizeof(out));

    args.GetReturnValue().Set(result.ToLocalChecked());
}

static
void encode(const FunctionCallbackInfo<Value>& args) {
	v8_des40(args, 0);
}

static
void decode(const FunctionCallbackInfo<Value>& args) {
	v8_des40(args, 1);
}

void Init(Handle<Object> exports) {
	NODE_SET_METHOD(exports, "encode", encode);
	NODE_SET_METHOD(exports, "decode", decode);
}

NODE_MODULE(des40, Init)
