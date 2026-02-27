import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
          <div className="size-6 text-primary">
            <span className="material-symbols-outlined text-3xl">exercise</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">HealthMate</h2>
        </div>
        
        {/* Search Bar */}
        <label className="flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-slate-500 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg" data-icon="MagnifyingGlass">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 focus:border-none h-full placeholder:text-slate-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal" 
              placeholder="Search exercises..." 
              defaultValue=""
            />
          </div>
        </label>
      </div>

      <div className="flex flex-1 justify-end gap-8">
        {/* Navigation Links */}
        <nav className="flex items-center gap-9">
          <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium leading-normal transition-colors">Dashboard</Link>
          <Link to="/workouts" className="text-primary text-sm font-medium leading-normal">Workouts</Link>
          <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium leading-normal transition-colors" href="/nutrition">Nutrition</a>
          <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium leading-normal transition-colors" href="/community">Community</a>
          <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium leading-normal transition-colors" href="/progress">Progress</a>
        </nav>
        
        {/* Actions & Profile */}
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
          <span className="truncate">Upgrade to Pro</span>
        </button>
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary" 
          data-alt="User profile avatar portrait" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuDqZ5uDyrASPI6hEP-S1LQatHTCfKWKhc7rgraISZ4VminkXl4rwRb7vpFal3rXDMCaVONmmeVdJaa-GY93IYikdSOHCFwShaw9TubquRp73-LS0_GaWE2Miu1mgylPyEIfqcECGt1cWygakaUWuMvrnR-zlbyoY87hPWM8Hrdc-BJufYHfV1Dyth3NHdYUv4GQ8ISX9nMMh3NDV65-jDsgHjnCNvT_DzJO_b-2zcZr7f2XuNgBEYfXmDf43o64uMJAamin93nPo")' }}
        ></div>
      </div>
    </header>
  );
};

export default Navbar;