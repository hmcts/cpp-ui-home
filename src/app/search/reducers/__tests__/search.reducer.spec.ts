import { SearchActions } from '../../actions';
import { UnifiedSearchCase } from '../../search.interfaces';
import { search } from '../search.reducer';

describe('search reducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const result = search(undefined, {} as any);

      expect(result).toMatchSnapshot();
    });
  });

  describe('SearchActions.loadUnifiedSearchCasesSuccess', () => {
    it('should add a pending request', () => {
      const action = SearchActions.loadUnifiedSearchCasesSuccess({
        params: { pageSize: 10 },
        cases: [{ caseId: '*' } as UnifiedSearchCase],
        totalResults: 1
      });
      const result = search(undefined, action);

      expect(result).toMatchSnapshot();
    });
  });

  describe('SearchActions.resetSearch', () => {
    it('should reset an existing search', () => {
      const action = SearchActions.resetSearch({ isBoxWorkHearing: false });
      const result = search(
        {
          params: { pageSize: 10 },
          cases: [{ caseId: '*' } as UnifiedSearchCase],
          totalResults: 1
        },
        action
      );

      expect(result).toMatchSnapshot();
    });
  });
});
