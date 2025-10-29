import React, { memo } from 'react';
import { UploadCSVDetailsHeadingBar } from '@client/upload-csv';
import Spreadsheet from 'react-spreadsheet';
import { useParams } from 'react-router';
import { GqlArray } from '@graphql';

type Props = {
  columns: GqlArray;
  data: any;
  logId: string;
};

export const UploadCSVDetailsCSVSkeleton = memo(({ columns, data, logId, updateSpreadSheetData, afterSave, mode }: Props) => {
  // const [data, setData] = useState(data);
  // const [columns, setColumns] = useState(columns);
  const params = useParams();
  // const { updateSpreadSheetData, updateLogId } = useContext(UploadCSVContext);

  const onChange = (modifiedData: any) => {
    console.log('modifiedData is', modifiedData);

    try {
      let content = modifiedData.map((item, index) => {
        let object = {};
        item.map((innerItem, index) => {
          let val = '';
          if (innerItem) val = innerItem.value;

          const newObj = { [`${columns[index]}`]: `${val}` };
          object = { ...object, ...newObj };
        });
        return object;
      });

      content = content.filter((objContent) => {
        var arrValues = Object.values(objContent);
        for (let index = 0; index < arrValues.length; index++) {
          if (arrValues[index] !== '') {
            return true;
          }
        }
      });

      updateSpreadSheetData(content);
    } catch (e) {
      console.log('print the issue cause=====>', e);
    }
  };

  return (
    <div className="w-full flex flex-col mt-6" data-testid="flnc-invoice-table-skeleton">
      <div className="w-full align-middle inline-block min-w-full">
        <UploadCSVDetailsHeadingBar cbOnSave={afterSave} mode={mode} />
        <div className="overflow-x-auto">
          <Spreadsheet data={data} columnLabels={columns} onChange={(data) => onChange(data)} />{' '}
        </div>
      </div>
    </div>
  );
});
