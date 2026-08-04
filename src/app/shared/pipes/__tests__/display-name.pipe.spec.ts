import { DisplayNamePipe } from '../display-name.pipe';

describe('DisplayNamePipe', () => {
  let pipe: DisplayNamePipe;

  beforeEach(() => {
    pipe = new DisplayNamePipe();
  });

  const person = {
    firstName: 'benjamin',
    lastName: 'potter'
  };

  it('should return a capitalised first name and uppercase last name', () => {
    expect(pipe.transform(person)).toEqual('Benjamin POTTER');
  });

  it('should return organisation name for organisations', () => {
    expect(pipe.transform({ organisationName: 'Smith Solicitors' })).toEqual('Smith Solicitors');
  });
});
