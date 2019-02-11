import acl_pb2
import acl_pb2_grpc
import grpc
import time

NUM_ITERS = 1000

def get_test_params():
    uid = "d1227778-23dd-4435-a239-a2132bd3d814"
    rid = "a54eb2bb-6988-4ace-8648-2f816f7291bb"
    channel = grpc.insecure_channel("localhost:5002")
    stub = acl_pb2_grpc.AclStub(channel)
    return (uid, rid, channel, stub)

def benchmark_read_permission():
    uid, rid, channel, stub = get_test_params()

    start = time.time()
    for i in range(1000):
        response = stub.IsPermissionedForRead(
            acl_pb2.PermissionRequest(
                user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
            )
        )
    end = time.time()
    print("Avg execution time: {}ms per acl read request over {} iterations".format((end - start)*1000/NUM_ITERS, NUM_ITERS))

def run():
    benchmark_read_permission()


if __name__ == "__main__":
    run()
