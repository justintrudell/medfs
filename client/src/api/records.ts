import { RecordItem } from "../models/records";

// TODO: uncomment once this is ready
// import * as recordService from "./record_service";

export function getAllForUser(userId: string): Promise<RecordItem[]> {
  const data = [
    {
      id: "1",
      name: "record1",
      hash: "foo",
      aclId: "acl1"
    },
    {
      id: "2",
      name: "record2",
      hash: "foo2",
      aclId: "acl2"
    },
    {
      id: "3",
      name: "record3",
      hash: "foo2",
      aclId: "acl2"
    }
  ];
  return new Promise((resolve, _reject) => {
    resolve(data);
  });
}
